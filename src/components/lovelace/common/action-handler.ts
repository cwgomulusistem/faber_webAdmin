import type { ActionConfig, ActionsConfig, HassContext, HassEntity } from '@/types/hass';

// ============================================
// Action Handler Types
// ============================================

export interface ActionHandlerDetail {
  action: 'tap' | 'hold' | 'double_tap';
}

export interface ActionConfigParams extends ActionsConfig {
  entity?: string;
  camera_image?: string;
  image_entity?: string;
}

// ============================================
// Check if action exists
// ============================================

export function hasAction(config?: ActionConfig): boolean {
  return config !== undefined && config.action !== 'none';
}

export function hasAnyAction(config: ActionsConfig): boolean {
  return (
    hasAction(config.tap_action) ||
    hasAction(config.hold_action) ||
    hasAction(config.double_tap_action)
  );
}

// ============================================
// Toggle Entity Helper
// ============================================

export async function toggleEntity(
  hass: HassContext, 
  entityId: string
): Promise<void> {
  const domain = entityId.split('.')[0];
  
  // Domains that use homeassistant.toggle
  const toggleDomains = [
    'automation', 'cover', 'fan', 'group', 'humidifier', 
    'input_boolean', 'light', 'media_player', 'script', 
    'siren', 'switch', 'vacuum', 'valve', 'water_heater'
  ];
  
  if (toggleDomains.includes(domain)) {
    await hass.callService('homeassistant', 'toggle', { entity_id: entityId });
  } else if (domain === 'lock') {
    const state = hass.states[entityId]?.state;
    if (state === 'locked') {
      await hass.callService('lock', 'unlock', { entity_id: entityId });
    } else {
      await hass.callService('lock', 'lock', { entity_id: entityId });
    }
  } else if (domain === 'scene') {
    await hass.callService('scene', 'turn_on', { entity_id: entityId });
  } else if (domain === 'button' || domain === 'input_button') {
    await hass.callService(domain, 'press', { entity_id: entityId });
  } else {
    // Fallback to homeassistant.toggle
    await hass.callService('homeassistant', 'toggle', { entity_id: entityId });
  }
}

// ============================================
// Main Action Handler
// ============================================

export interface HandleActionOptions {
  hass: HassContext;
  config: ActionConfigParams;
  action: 'tap' | 'hold' | 'double_tap';
  onMoreInfo?: (entityId: string) => void;
  onNavigate?: (path: string, replace?: boolean) => void;
  onConfirm?: (text: string) => Promise<boolean>;
  onToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export async function handleAction({
  hass,
  config,
  action,
  onMoreInfo,
  onNavigate,
  onConfirm,
  onToast,
}: HandleActionOptions): Promise<void> {
  let actionConfig: ActionConfig | undefined;

  // Get the appropriate action config
  if (action === 'double_tap' && config.double_tap_action) {
    actionConfig = config.double_tap_action;
  } else if (action === 'hold' && config.hold_action) {
    actionConfig = config.hold_action;
  } else if (action === 'tap' && config.tap_action) {
    actionConfig = config.tap_action;
  }

  // Default to more-info if no action configured
  if (!actionConfig) {
    actionConfig = { action: 'more-info' };
  }

  // Handle confirmation
  if (actionConfig.confirmation && onConfirm) {
    const confirmText = actionConfig.confirmation.text || 'Are you sure you want to perform this action?';
    const confirmed = await onConfirm(confirmText);
    if (!confirmed) return;
  }

  // Execute the action
  switch (actionConfig.action) {
    case 'more-info': {
      const entityId = actionConfig.entity || config.entity || config.camera_image || config.image_entity;
      if (entityId) {
        if (onMoreInfo) {
          onMoreInfo(entityId);
        } else {
          console.log('More info:', entityId);
        }
      } else {
        onToast?.('No entity specified for more-info action', 'warning');
      }
      break;
    }

    case 'toggle': {
      if (config.entity) {
        try {
          await toggleEntity(hass, config.entity);
          // Haptic feedback (optional)
        } catch (err) {
          console.error('Toggle failed:', err);
          onToast?.('Failed to toggle entity', 'error');
        }
      } else {
        onToast?.('No entity specified for toggle action', 'warning');
      }
      break;
    }

    case 'navigate': {
      if (actionConfig.navigation_path) {
        if (onNavigate) {
          onNavigate(actionConfig.navigation_path, actionConfig.navigation_replace);
        } else {
          // Fallback to window.location
          if (actionConfig.navigation_replace) {
            window.location.replace(actionConfig.navigation_path);
          } else {
            window.location.href = actionConfig.navigation_path;
          }
        }
      } else {
        onToast?.('No navigation path specified', 'warning');
      }
      break;
    }

    case 'url': {
      if (actionConfig.url_path) {
        window.open(actionConfig.url_path, '_blank');
      } else {
        onToast?.('No URL specified', 'warning');
      }
      break;
    }

    case 'call-service':
    case 'perform-action': {
      const service = actionConfig.perform_action || actionConfig.service;
      if (!service) {
        onToast?.('No service specified', 'warning');
        return;
      }

      const [domain, serviceName] = service.split('.', 2);
      const serviceData = actionConfig.data ?? actionConfig.service_data ?? {};
      
      try {
        await hass.callService(domain, serviceName, serviceData, actionConfig.target);
        // Haptic feedback
      } catch (err) {
        console.error('Service call failed:', err);
        onToast?.(`Failed to call ${service}`, 'error');
      }
      break;
    }

    case 'fire-dom-event': {
      // Custom event for advanced users
      const event = new CustomEvent('ll-custom', {
        detail: actionConfig,
        bubbles: true,
        composed: true,
      });
      document.dispatchEvent(event);
      break;
    }

    case 'none':
    default:
      // Do nothing
      break;
  }
}

// ============================================
// Action Handler Hook for Components
// ============================================

export interface UseActionHandlerOptions {
  hass: HassContext;
  config: ActionConfigParams;
  onMoreInfo?: (entityId: string) => void;
  onNavigate?: (path: string, replace?: boolean) => void;
}

export interface ActionHandlerResult {
  handleTap: () => Promise<void>;
  handleHold: () => Promise<void>;
  handleDoubleTap: () => Promise<void>;
  hasAction: boolean;
  hasTapAction: boolean;
  hasHoldAction: boolean;
  hasDoubleTapAction: boolean;
}

export function createActionHandlers(options: UseActionHandlerOptions): ActionHandlerResult {
  const { hass, config, onMoreInfo, onNavigate } = options;

  const handleTap = async () => {
    await handleAction({
      hass,
      config,
      action: 'tap',
      onMoreInfo,
      onNavigate,
    });
  };

  const handleHold = async () => {
    await handleAction({
      hass,
      config,
      action: 'hold',
      onMoreInfo,
      onNavigate,
    });
  };

  const handleDoubleTap = async () => {
    await handleAction({
      hass,
      config,
      action: 'double_tap',
      onMoreInfo,
      onNavigate,
    });
  };

  return {
    handleTap,
    handleHold,
    handleDoubleTap,
    hasAction: hasAnyAction(config),
    hasTapAction: hasAction(config.tap_action),
    hasHoldAction: hasAction(config.hold_action),
    hasDoubleTapAction: hasAction(config.double_tap_action),
  };
}

// ============================================
// Long Press Detection Hook
// ============================================

export interface LongPressHandlers {
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onMouseLeave: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onTouchCancel: (e: React.TouchEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
}

interface UseLongPressOptions {
  onTap?: () => void;
  onHold?: () => void;
  onDoubleTap?: () => void;
  holdDelay?: number;
  doubleTapDelay?: number;
}

export function createLongPressHandlers({
  onTap,
  onHold,
  onDoubleTap,
  holdDelay = 500,
  doubleTapDelay = 300,
}: UseLongPressOptions): LongPressHandlers {
  let holdTimer: ReturnType<typeof setTimeout> | null = null;
  let tapCount = 0;
  let tapTimer: ReturnType<typeof setTimeout> | null = null;
  let isHolding = false;

  const clearTimers = () => {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
  };

  const startHold = () => {
    isHolding = false;
    clearTimers();
    holdTimer = setTimeout(() => {
      isHolding = true;
      onHold?.();
    }, holdDelay);
  };

  const endHold = () => {
    clearTimers();
    if (!isHolding) {
      // Handle tap / double tap
      tapCount++;
      if (tapTimer) {
        clearTimeout(tapTimer);
      }
      
      if (onDoubleTap && tapCount === 2) {
        tapCount = 0;
        onDoubleTap();
      } else {
        tapTimer = setTimeout(() => {
          if (tapCount === 1) {
            onTap?.();
          }
          tapCount = 0;
        }, doubleTapDelay);
      }
    }
    isHolding = false;
  };

  const cancelHold = () => {
    clearTimers();
    isHolding = false;
  };

  return {
    onMouseDown: () => startHold(),
    onMouseUp: () => endHold(),
    onMouseLeave: () => cancelHold(),
    onTouchStart: () => startHold(),
    onTouchEnd: () => endHold(),
    onTouchCancel: () => cancelHold(),
    onClick: (e) => {
      // Prevent default click if we're handling taps manually
      if (onTap || onDoubleTap) {
        e.preventDefault();
      }
    },
    onDoubleClick: (e) => {
      if (onDoubleTap) {
        e.preventDefault();
      }
    },
  };
}

// ============================================
// Compute Entity Name
// ============================================

export function computeEntityName(
  hass: HassContext,
  stateObj: HassEntity | undefined,
  configName?: string
): string {
  if (configName) return configName;
  if (!stateObj) return '';
  
  // Check entity registry for custom name
  const entityEntry = hass.entities?.[stateObj.entity_id];
  if (entityEntry?.name) return entityEntry.name;
  
  // Fallback to friendly_name or entity_id
  return stateObj.attributes.friendly_name || stateObj.entity_id;
}

// ============================================
// Domains that support toggle
// ============================================

export const DOMAINS_TOGGLE = new Set([
  'automation',
  'cover',
  'fan',
  'group',
  'humidifier',
  'input_boolean',
  'light',
  'lock',
  'media_player',
  'remote',
  'scene',
  'script',
  'siren',
  'switch',
  'vacuum',
  'valve',
  'water_heater',
]);

export function supportsToggle(entityId: string): boolean {
  const domain = entityId.split('.')[0];
  return DOMAINS_TOGGLE.has(domain);
}

// ============================================
// Get default action for entity
// ============================================

export function getDefaultAction(entityId: string): ActionConfig {
  const domain = entityId.split('.')[0];
  
  if (DOMAINS_TOGGLE.has(domain)) {
    return { action: 'toggle' };
  }
  
  if (['button', 'input_button', 'scene'].includes(domain)) {
    return { action: 'toggle' };
  }
  
  return { action: 'more-info' };
}

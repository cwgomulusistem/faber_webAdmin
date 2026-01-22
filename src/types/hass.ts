export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: {
    friendly_name?: string;
    unit_of_measurement?: string;
    icon?: string;
    [key: string]: any;
  };
  last_changed: string;
  last_updated: string;
}

export interface HassContext {
  states: { [key: string]: HassEntity };
  callService: (domain: string, service: string, data?: any) => Promise<void>;
}

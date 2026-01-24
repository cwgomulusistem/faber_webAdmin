'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ScheduledAccess() {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const activeDays = [0, 1, 2, 3, 4]; // M-F active

    return (
        <section className="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
            <div className="flex items-center gap-2 mb-6">
                <Clock className="text-primary w-6 h-6" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Scheduled Access</h3>
            </div>

            <div className="flex flex-col gap-8">
                {/* Active Days */}
                <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Active Days</label>
                    <div className="flex flex-wrap gap-2">
                        {days.map((day, index) => {
                            const isActive = activeDays.includes(index);
                            return (
                                <button
                                    key={index}
                                    className={cn(
                                        "size-10 rounded-full font-bold text-sm shadow-sm transition-all active:scale-95",
                                        isActive
                                            ? "bg-primary text-white hover:bg-blue-600 shadow-md"
                                            : "bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                                    )}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Time Window Slider */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Time Window</label>
                        <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">06:00 AM - 10:00 PM</span>
                    </div>

                    <div className="relative h-10 flex items-center px-2 select-none group">
                        {/* Track */}
                        <div className="absolute w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full left-0"></div>

                        {/* Range Fill */}
                        <div
                            className="absolute h-1.5 bg-primary rounded-full"
                            style={{ left: '25%', width: '66%' }}
                        ></div>

                        {/* Thumbs */}
                        <div
                            className="absolute size-5 bg-white border-2 border-primary rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform -mt-[1px]"
                            style={{ left: '25%' }}
                        ></div>
                        <div
                            className="absolute size-5 bg-white border-2 border-primary rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform -mt-[1px]"
                            style={{ left: '91%' }}
                        ></div>

                        {/* Time Markers */}
                        <div className="absolute -bottom-2 w-full flex justify-between text-[10px] text-slate-400 font-medium px-0 pointer-events-none">
                            <span>00:00</span>
                            <span>06:00</span>
                            <span>12:00</span>
                            <span>18:00</span>
                            <span>24:00</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

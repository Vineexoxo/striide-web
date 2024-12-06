/**
 *  Purpose: This component was built to refactor the earlier Navbar component to
 *           avoid prop drilling with the map component.
 *
 *  Pattern: composability
 *
 *  Note   : React plans to depreciate the forwardRef attribute. This should not be
 *           a major issue to rework in the future. See the following for more information
 *           when react version 19 comes out. (link may be broken in the future)
 *
 *           https://19.react.dev/reference/react/forwardRef
 */

import React, { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";
import { Feature, Suggestion } from '@/lib/types';
import { MapPin } from 'lucide-react';

const NavbarRoot = React.forwardRef<
    HTMLDivElement,
    ComponentPropsWithRef<"div"> & {
        separator?: React.ReactNode;
    }
>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        {...props}
        className={cn(
            className,
            "flex flex-row items-center justify-center gap-x-2",
        )}
    >
        {children}
    </div>
));
NavbarRoot.displayName = "NavbarRoot";

const NavbarSearch = React.forwardRef<
    HTMLInputElement,
    ComponentPropsWithRef<"input"> & {
        separator?: React.ReactNode;
    }
>(({ className, placeholder, onChange, ...props }, ref) => (
    <input
        ref={ref}
        {...props}
        placeholder={placeholder}
        onChange={onChange}
        className={cn(
            className,
            "h-8 w-72 appearance-none rounded-full border border-black px-9 text-base placeholder:italic placeholder:text-black focus:border-2 focus:outline-none focus:outline-0 active:border-2",
        )}
    />
));
NavbarSearch.displayName = "NavbarSearch";

const NavbarDropdownOptions = React.forwardRef<
    HTMLDivElement,
    ComponentPropsWithRef<"div"> & {
        separator?: React.ReactNode,
        suggestions: Suggestion[],
        isOpen?: boolean
    }
>(({ className, suggestions, isOpen, onClick, ...props }, ref) => {
    return <>
        {isOpen &&
            <div
                {...props}
                ref={ref}
            >
                {suggestions.length === 1 && suggestions[0].name === "" ? (
                    <div className={cn(className, 'absolute left-14 w-64 border-b border-l border-r border-grey-hi-fi bg-offwhite-hi-fi')}>
                        <div
                            className={"flex flex-row gap-x-2 px-1 justify-center items-center h-10 border-grey-hi-fi text-sm border-l border-r border-b"}
                        >
                            <MapPin className='w-5 h-w-5' />
                            Your query returned no results
                        </div>
                    </div>
                ) : (
                    <div className={cn(className, 'absolute left-14 w-64 bg-offwhite-hi-fi')}>
                        {suggestions.length > 0 && (suggestions as Suggestion[]).map((suggestion: Suggestion, idx: number) => (
                            <div
                                className={"flex flex-row gap-x-2 px-1 justify-center items-center h-fit border border-grey-hi-fi text-sm text-wrap cursor-pointer " + (idx === 0 ? "border-l border-r border-b" : "border")}
                                key={suggestion.mapbox_id}
                            >
                                <MapPin className='w-5 h-w-5' />
                                <div className="w-full active:scale-95" onClick={(e) => {
                                    (e as any).mapbox_id = suggestion.mapbox_id;
                                    onClick!(e);
                                }}>
                                    {suggestion.full_address}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>}
    </>;
})
NavbarDropdownOptions.displayName = "NavbarDropdownOptions"

const NavbarButton = React.forwardRef<
    HTMLButtonElement,
    ComponentPropsWithRef<"button"> & {
        separator?: React.ReactNode;
    }
>(({ className, children, ...props }, ref) => (
    <button
        {...props}
        ref={ref}
        className={cn(
            className,
            "flex h-8 w-8 items-center justify-center rounded-full active:scale-95 active:border-2",
        )}
    >
        {children}
    </button>
));
NavbarButton.displayName = "NavbarButton";

export { NavbarRoot, NavbarSearch, NavbarDropdownOptions, NavbarButton };

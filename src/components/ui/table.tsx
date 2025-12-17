/**
 * Componente DataTable - Tabla de Datos Densa para Admin
 * 
 * Tabla estilizada para mostrar datos tabulares.
 * Diseñada para ser densa y eficiente en espacio.
 * 
 * Características:
 * - Header fijo con ordenamiento
 * - Filas con hover effect
 * - Soporte para acciones por fila
 * - Paginación integrada
 * - Responsive con scroll horizontal
 */

import * as React from 'react'
import { cn } from '@/utils/cn'

/**
 * Componente raíz de la tabla
 */
const Table = React.forwardRef<
    HTMLTableElement,
    React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
        <table
            ref={ref}
            className={cn("w-full caption-bottom text-sm", className)}
            {...props}
        />
    </div>
))
Table.displayName = "Table"

/**
 * Header de la tabla
 */
const TableHeader = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

/**
 * Body de la tabla
 */
const TableBody = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tbody
        ref={ref}
        className={cn("[&_tr:last-child]:border-0", className)}
        {...props}
    />
))
TableBody.displayName = "TableBody"

/**
 * Footer de la tabla
 */
const TableFooter = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tfoot
        ref={ref}
        className={cn(
            "border-t bg-slate-800/50 font-medium [&>tr]:last:border-b-0",
            className
        )}
        {...props}
    />
))
TableFooter.displayName = "TableFooter"

/**
 * Fila de la tabla
 */
const TableRow = React.forwardRef<
    HTMLTableRowElement,
    React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
    <tr
        ref={ref}
        className={cn(
            "border-b border-slate-800 transition-colors",
            "hover:bg-slate-800/50 data-[state=selected]:bg-slate-800",
            className
        )}
        {...props}
    />
))
TableRow.displayName = "TableRow"

/**
 * Celda de header
 */
const TableHead = React.forwardRef<
    HTMLTableCellElement,
    React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <th
        ref={ref}
        className={cn(
            "h-10 px-3 text-left align-middle font-medium text-slate-400",
            "[&:has([role=checkbox])]:pr-0 whitespace-nowrap",
            className
        )}
        {...props}
    />
))
TableHead.displayName = "TableHead"

/**
 * Celda de datos
 */
const TableCell = React.forwardRef<
    HTMLTableCellElement,
    React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <td
        ref={ref}
        className={cn(
            "px-3 py-2 align-middle text-slate-300",
            "[&:has([role=checkbox])]:pr-0",
            className
        )}
        {...props}
    />
))
TableCell.displayName = "TableCell"

/**
 * Caption de la tabla
 */
const TableCaption = React.forwardRef<
    HTMLTableCaptionElement,
    React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
    <caption
        ref={ref}
        className={cn("mt-4 text-sm text-slate-400", className)}
        {...props}
    />
))
TableCaption.displayName = "TableCaption"

export {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
}

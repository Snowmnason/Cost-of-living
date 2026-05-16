import * as React from "react"
import { ChevronDown } from "lucide-react"

interface AccordionProps {
  type?: "single" | "multiple"
  collapsible?: boolean
  children: React.ReactNode
  className?: string
}

interface AccordionItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

interface AccordionTriggerProps {
  children: React.ReactNode
  className?: string
}

interface AccordionContentProps {
  children: React.ReactNode
  className?: string
}

const AccordionContext = React.createContext<{
  openItems: Set<string>
  toggleItem: (value: string) => void
  isSingle: boolean
}>({
  openItems: new Set(),
  toggleItem: () => {},
  isSingle: false,
})

export const Accordion = React.forwardRef<
  HTMLDivElement,
  AccordionProps
>(({ type = "single", collapsible = true, children, className }, ref) => {
  const [openItems, setOpenItems] = React.useState<Set<string>>(new Set())

  const toggleItem = (value: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(value)) {
        if (collapsible) {
          newSet.delete(value)
        }
      } else {
        if (type === "single") {
          newSet.clear()
        }
        newSet.add(value)
      }
      return newSet
    })
  }

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, isSingle: type === "single" }}>
      <div ref={ref} className={`w-full border border-border rounded-lg ${className}`}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
})
Accordion.displayName = "Accordion"

export const AccordionItem = React.forwardRef<
  HTMLDivElement,
  AccordionItemProps
>(({ value, children, className }, ref) => {
  const context = React.useContext(AccordionContext)
  const isOpen = context.openItems.has(value)

  return (
    <div ref={ref} className={`border-b last:border-b-0 ${className}`}>
      <AccordionContext.Provider value={{ ...context, openItems: context.openItems }}>
        <div data-state={isOpen ? "open" : "closed"}>
          {React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(child as React.ReactElement<any>, { itemValue: value, isOpen })
              : child
          )}
        </div>
      </AccordionContext.Provider>
    </div>
  )
})
AccordionItem.displayName = "AccordionItem"

export const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  AccordionTriggerProps & { itemValue?: string; isOpen?: boolean }
>(({ children, className, itemValue = "", isOpen = false }, ref) => {
  const context = React.useContext(AccordionContext)

  return (
    <button
      ref={ref}
      onClick={() => context.toggleItem(itemValue)}
      className={`flex w-full items-center justify-between py-4 px-6 font-medium text-2xl hover:bg-muted/50 transition text-left ${className}`}
      data-state={isOpen ? "open" : "closed"}
    >
      {children}
      <ChevronDown
        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
  )
})
AccordionTrigger.displayName = "AccordionTrigger"

export const AccordionContent = React.forwardRef<
  HTMLDivElement,
  AccordionContentProps & { isOpen?: boolean }
>(({ children, className, isOpen = false }, ref) => {
  if (!isOpen) return null

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <div className="pb-5 px-6 pt-0 text-2xl">{children}</div>
    </div>
  )
})
AccordionContent.displayName = "AccordionContent"

import classes from 'lib/ui/PanelSection.module.css'

export function PanelSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <section className={classes.section}>
      <div className={classes.sectionTitle}>{title}</div>
      {children}
    </section>
  )
}

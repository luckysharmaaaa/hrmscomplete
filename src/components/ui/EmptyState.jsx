
/**
 * EmptyState — "nothing here" block for tables and cards.
 *
 * <EmptyState icon={Users} title="No users found"
 *             description="No records match your current search or filter criteria."
 *             action={<button className="hr-btn hr-btn-outline hr-btn-sm">Clear filters</button>} />
 */
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="mx-auto max-w-sm px-4 py-14 text-center">
      {Icon && (
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
        </div>
      )}

      <p className="text-sm font-semibold text-text-primary">{title}</p>

      {description && (
        <p className="mt-1 text-xs leading-5 text-text-secondary">{description}</p>
      )}

      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

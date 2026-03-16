type FeaturePlaceholderProps = {
  title: string;
  description: string;
};

export function FeaturePlaceholder({ title, description }: FeaturePlaceholderProps) {
  return (
    <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">{description}</p>
    </section>
  );
}

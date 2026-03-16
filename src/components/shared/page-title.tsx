type PageTitleProps = {
  title: string;
  description: string;
};

export function PageTitle({ title, description }: PageTitleProps) {
  return (
    <header className="space-y-2">
      <h1 className="text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h1>
      <p className="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
        {description}
      </p>
    </header>
  );
}

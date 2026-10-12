// A centred landing-page section heading with a lead line under it; id is what the section's aria-labelledby points at
export default function SectionHeading({ id, title, subtitle }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h2 id={id} className="text-[clamp(32px,3.2vw,40px)] leading-[1.2] font-bold tracking-[-0.01em]">
        {title}
      </h2>
      <p className="max-w-[640px] text-lg/8 text-muted">{subtitle}</p>
    </div>
  );
}

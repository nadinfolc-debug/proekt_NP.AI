import { asset } from "../lib/asset";

const backdropSrc = asset("media/works/обо мне.png");

/** Soft warm underlay shared across light page sections. */
export function SectionBackdrop() {
  return (
    <div className="section-backdrop" aria-hidden="true">
      <img className="section-backdrop-img" src={backdropSrc} alt="" decoding="async" />
    </div>
  );
}

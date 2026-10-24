import { VideoHandGallery } from "../components/VideoHandGallery";
import { Seo } from "../components/Seo";

export function VideosPage() {
  return (
    <article className="page">
      <Seo
        title="Видео — NP.AI Prikolota"
        description="Короткие ролики NP.AI Prikolota: косметика, аксессуары, lifestyle и стилизация. Авторские концепты в движении."
      />
      <div className="container">
        <p className="eyebrow">Портфолио</p>
        <h1>Ролики, в которых продукт остаётся в движении.</h1>
        <p className="lead">
          Четыре серии. Нажмите на карту — слева пояснение, справа направление. Звук выключен.
        </p>
      </div>
      <div className="container">
        <VideoHandGallery />
      </div>
    </article>
  );
}

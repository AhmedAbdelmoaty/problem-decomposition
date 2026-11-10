import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "مين طفّى المدينة؟" },
      { name: "description", content: "لعبة تحقيق: اكتشف سبب انطفاء الكهرباء في المدينة." },
      { property: "og:title", content: "مين طفّى المدينة؟" },
      { property: "og:description", content: "لعبة تحقيق: اكتشف سبب انطفاء الكهرباء في المدينة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <iframe
      src="/game/index.html"
      title="مين طفّى المدينة؟"
      className="fixed inset-0 h-screen w-screen border-0"
      allow="autoplay"
    />
  );
}

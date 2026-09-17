import { getSiteSettings } from "@/lib/data/settings";

/** A small, fixed-size video card — hidden entirely until an admin sets a video URL in Settings. */
export async function ReviewVideoCard() {
  const settings = await getSiteSettings();
  if (!settings.reviewVideoUrl) return null;

  return (
    <div className="container-page py-8">
      <div className="w-full max-w-[280px]">
        <video
          src={settings.reviewVideoUrl}
          controls
          playsInline
          preload="none"
          className="aspect-[9/16] w-full rounded-xl bg-surface-sunken object-cover"
        />
        {settings.reviewVideoCaption && (
          <p className="mt-2 text-sm text-ink-muted">{settings.reviewVideoCaption}</p>
        )}
      </div>
    </div>
  );
}

import webpush from "web-push";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BE9Jp1A5johU7d8mKlLLvenfLMfJTdpdBXDLJBJ1uCYaqfEFPo9TnKoKLqnzazCyu6Razfe2OQzbo_EUXQT-sE8";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "kdgMgbW6ZpLIicZF9uD8pjhweCVni4JWByNnmnn2Y9I";

webpush.setVapidDetails(
  "mailto:moja-dieta@duckdns.org",
  VAPID_PUBLIC,
  VAPID_PRIVATE
);

export async function sendPush(subscription: webpush.PushSubscription, title: string, body: string) {
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body, icon: "/icons/icon-192.svg" })
    );
    return true;
  } catch (error) {
    console.error("Push failed:", error);
    return false;
  }
}

export { VAPID_PUBLIC };

async function initChatKit() {
  const response = await fetch("https://mackenzie-functions.azurewebsites.net/api/chatkit-session"); // 👈 uses your Azure Function
  const data = await response.json();

  if (!data?.debug?.body_text) throw new Error("No ChatKit response");
  const session = JSON.parse(data.debug.body_text);

  // Initialize ChatKit client using the session info
  window.chat = new ChatKit({
    client_secret: session.client_secret,
  });

  console.log("✅ ChatKit initialized:", session.id);
}

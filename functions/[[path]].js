export default {
  async onRequest(context) { // Pages uses onRequest, not fetch
    const { request, env } = context; // Pull request and env out of context
    const MY_PIN = env.SECRET_PIN;
    const cookieName = "gatekeeper_auth";

    // 1. Check if the user already has the valid cookie
    const cookie = request.headers.get("Cookie");
    if (cookie && cookie.includes(`${cookieName}=true`)) {
      return fetch(request); // Let them through to your site! ✅
    }

    // 2. Handle the PIN submission
    if (request.method === "POST") {
      const formData = await request.formData();
      const enteredPin = formData.get("pin");

      if (enteredPin === MY_PIN) {
        // Correct PIN! Set cookie and refresh
        return new Response("Authenticated!", {
          status: 302,
          headers: {
            "Set-Cookie": `${cookieName}=true; Path=/; HttpOnly; SameSite=Strict`,
            "Location": request.url,
          },
        });
      } else {
        return new Response("Wrong PIN! Try again.", { status: 403 });
      }
    }

    // 3. Show the simple Login Page if not authenticated
    const html = `
<!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>需要身份验证 🔒</title>
        <style>
          body { display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif; background:#f0f2f5; margin:0; }
          .card { background:white; padding:2rem; border-radius:12px; box-shadow: 0 8px 16px rgba(0,0,0,0.1); width: 300px; text-align: center; }
          h2 { color: #1c1e21; margin-bottom: 1.5rem; }
          input { padding:12px; width:100%; margin-bottom:1.2rem; border:1px solid #ddd; border-radius:6px; box-sizing: border-box; font-size: 16px; }
          button { width:100%; padding:12px; background:#007bff; color:white; border:none; border-radius:6px; cursor:pointer; font-size: 16px; transition: background 0.2s; }
          button:hover { background: #0056b3; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>消防隊巷 🔑</h2>
          <form method="POST">
            <input type="password" name="pin" placeholder="輸入號碼..." required>
            <button type="submit">立即解鎖 🚀</button>
          </form>
        </div>
      </body>
      </html>
    `;

    return new Response(html, { headers: { "Content-Type": "text/html" } });
  }
};

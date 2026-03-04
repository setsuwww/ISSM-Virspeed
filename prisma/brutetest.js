import fetch from "node-fetch"

const email = "admin@mail.com"

await Promise.all(
  Array.from({ length: 50 }).map((_, i) =>
    fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: "wrong" + i
      }),
    })
  )
)

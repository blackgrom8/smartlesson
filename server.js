const express = require("express")
const path = require("path")
const admin = require("firebase-admin")
const serviceAccount = require("./firebase-key.json")

// Firebase Admin инициализация
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

const app = express()
const PORT = 3000

// Middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))

// Главная страница формы
app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"))
})

// Страница "Спасибо"
app.get("/thankyou", (req, res) => {
  res.sendFile(path.join(__dirname, "views/thankyou.html"))
})

// Обработка формы
app.post("/submit", async (req, res) => {
  const { name, email } = req.body

  try {
    await db.collection("registrations").add({
      name,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    console.log(`✅ Добавлено: ${name} <${email}>`)

    // Перенаправление на thankyou.html с параметрами
    res.redirect(`/thankyou?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`)
  } catch (err) {
    console.error("❌ Ошибка Firestore:", err)
    res.status(500).send("Ошибка при сохранении данных.")
  }
})

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер работает: http://localhost:${PORT}`)
})

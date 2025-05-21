const express = require("express")
const path = require("path")
const admin = require("firebase-admin")

// ✅ Чтение firebase credentials из переменной среды
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()
const app = express()

// ⚠️ Koyeb даёт порт через переменную среды
const PORT = process.env.PORT || 8000

// Middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))

// Главная страница с формой
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
    res.redirect(`/thankyou?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`)
  } catch (err) {
    console.error("❌ Ошибка Firestore:", err)
    res.status(500).send("Ошибка при сохранении данных.")
  }
})

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер работает на порту ${PORT}`)
})

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```mesut

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Firebase: Otomatik Deploy (GitHub Actions) 🔁

Bu repo, `main` branch'e push yapıldığında (veya manuel tetiklendiğinde) Firebase Hosting'e otomatik deploy yapmak üzere bir GitHub Action içerir.

Adımlar:

1. Firebase Console → Project settings → *Service accounts* → Yeni servis hesabı oluşturup **JSON** anahtarını indir.
2. GitHub → repository → **Settings → Secrets and variables → Actions → New repository secret**
   - Secret adı: `FIREBASE_SERVICE_ACCOUNT`
   - Değer: İndirdiğin JSON dosyasının **tam içeriğini** yapıştır.
3. Alternatif olarak `firebase login:ci` ile alınan token'ı `FIREBASE_TOKEN` adıyla secret olarak ekleyebilirsin.
4. Değişiklikleri `main`'e push ettiğinde workflow çalışır. Manuel tetikleme için Actions → ilgili workflow → *Run workflow*'u kullan.

Not: `FIREBASE_SERVICE_ACCOUNT` veya `FIREBASE_TOKEN` yoksa workflow başlatılmayacak ve temiz bir hata mesajı verecektir.


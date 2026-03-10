# 🧠 Headache Tracker

Rastreie suas dores de cabeça — frequência, intensidade, gatilhos e padrões.

PWA instalável no celular (funciona offline!).

## Deploy no Vercel (passo a passo)

### 1. Crie uma conta no GitHub (se não tiver)
- Acesse [github.com](https://github.com) e crie uma conta

### 2. Crie um repositório
- Clique em **New repository**
- Dê o nome `headache-tracker`
- Deixe **Public**
- Clique em **Create repository**

### 3. Suba os arquivos
Se tiver Git instalado no computador:
```bash
cd headache-tracker
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/headache-tracker.git
git push -u origin main
```

Ou simplesmente arraste todos os arquivos pelo site do GitHub.

### 4. Deploy no Vercel
- Acesse [vercel.com](https://vercel.com) e faça login com sua conta GitHub
- Clique em **Add New → Project**
- Selecione o repositório `headache-tracker`
- O Vercel detecta automaticamente que é um projeto Vite
- Clique em **Deploy**
- Em ~1 minuto seu site estará no ar com uma URL tipo `headache-tracker-xyz.vercel.app`

## Instalar no Celular (como se fosse um app)

### iPhone (Safari)
1. Abra a URL do seu site no **Safari**
2. Toque no botão de **compartilhar** (quadrado com seta pra cima)
3. Role para baixo e toque em **"Adicionar à Tela de Início"**
4. Confirme o nome e toque em **Adicionar**

### Android (Chrome)
1. Abra a URL do seu site no **Chrome**
2. Toque no menu **⋮** (três pontos)
3. Toque em **"Adicionar à tela inicial"** ou **"Instalar app"**
4. Confirme

Pronto! O app aparece na sua tela inicial, abre em tela cheia sem barra do navegador, e funciona offline.

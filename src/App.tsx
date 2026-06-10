import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ClerkProvider, SignIn, SignUp } from '@clerk/clerk-react'
import { Header } from './components/Header'
import { HomePage } from './pages/HomePage'
import { CampaignsPage } from './pages/CampaignsPage'
import { CampaignDetailPage } from './pages/CampaignDetailPage'
import { CreateCampaignPage } from './pages/CreateCampaignPage'
import { ProfilePage } from './pages/ProfilePage'

const PUBLISHABLE_KEY = 'pk_test_Z2FtZS1waWdlb24tNzQuY2xlcmsuYWNjb3VudHMuZGV2JA'

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <div className="min-h-screen bg-secondary-900 font-body">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/campaign/:id" element={<CampaignDetailPage />} />
            <Route path="/create" element={<CreateCampaignPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" redirectUrl="/" />} />
            <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" redirectUrl="/" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ClerkProvider>
  )
}

export default App

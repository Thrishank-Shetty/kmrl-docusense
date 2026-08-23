import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register"

import AppLayout from "../components/layout/AppLayout";
import Dashboard from "../pages/app/Dashboard";
import ManualReview from "../pages/app/ManualReview";
import AiSearch from "../pages/app/AiSearch";
import Analytics from "../pages/app/Analytics";
import Compliance from "../pages/app/Compliance";
import Documents from "../pages/app/Documents";
import Settings from "../pages/app/Settings";
import Upload from "../pages/app/Upload";
import NotFound from "../pages/app/NotFound";


export default function AppRoutes(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Auth Check */}
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>

                {/* Application */}
                <Route element={<AppLayout/>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/upload" element={<Upload />} />
                    <Route path="/documents" element={<Documents />} />
                    {/* <Route path="/documents/:id" element={<DocumentDetails />} /> */}
                    <Route path="/compliance" element={<Compliance />} />
                    <Route path="/review" element={<ManualReview/>}/>
                    <Route path="/ai-search" element={<AiSearch />} />
                    <Route path="/analytics" element={<Analytics/>}/>
                    <Route path="/settings" element={<Settings/>}/>
                </Route>
                <Route path="*" element={<NotFound />} />

            </Routes>
        </BrowserRouter>
    )
}
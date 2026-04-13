import {Navigate, Routes, Route} from "react-router-dom";
import {BaseLayout} from "../layout/BaseLayout";
import Home from "../pages/Home";
import Beverages from "../pages/Beverages";
import Stats from "../pages/Stats";
import Support from "../pages/Support";
import NavLayout from "../layout/NavLayout";
import Admin from "../pages/Admin.tsx";
import {useAuth} from "../auth/AuthContext";

function AdminRoute() {
    const {user, isLoading} = useAuth();
    const isAdmin = user?.roles?.some((role) => role === "ADMIN" || role === "ROLE_ADMIN") ?? false;

    if (isLoading) {
        return null;
    }

    return isAdmin ? <Admin/> : <Navigate to="/drinks" replace/>;
}

export default function App() {
    return (
        <Routes>
            <Route element={<BaseLayout/>}>
                <Route index element={<Home/>}/>
                <Route element={<NavLayout/>}>
                    <Route path="admin" element={<AdminRoute/>}/>
                    <Route path="drinks" element={<Beverages/>}/>
                    <Route path="stats" element={<Stats/>}/>
                    <Route path="support" element={<Support/>}/>
                </Route>
            </Route>
        </Routes>
    );
}

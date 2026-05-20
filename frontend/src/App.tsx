import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import TestPage from "./pages/TestPage";


const App: React.FC = () => {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/test"
                    element={<TestPage />}
                />
                <Route path="*" element={<Navigate to="/test" replace />} />
            </Routes>

        </BrowserRouter>
    );
};

export default App;
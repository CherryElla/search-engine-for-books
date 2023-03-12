import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SearchBooks from "./pages/SearchBooks";
import SavedBooks from "./pages/SavedBooks";
import Navbar from "./components/Navbar";

function App() {
    return (
        <Router>
            <>
                <Navbar />
                <Routes>
                    <Route index element={<SearchBooks />} />
                    <Route path="/search" element={<SearchBooks />} />
                    <Route path="/saved" element={<SavedBooks />} />
                    <Route
                        path="/*"
                        render={() => (
                            <h1 className="display-2">Wrong page!</h1>
                        )}
                    />
                </Routes>
            </>
        </Router>
    );
}

export default App;

import { useSelector } from "react-redux"
import LeftSidebar from "./LeftSidebar"
import RightSidebar from "./RightSidebar"

export default function MainLayout({ children }) {
    const { loading } = useSelector((state) => state.auth)

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#fafafa" }}>
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div style={{ display: "flex", justifyContent: "center", backgroundColor: "#fafafa", minHeight: "100vh" }}>
            <LeftSidebar />
            <main style={{ width: "600px", margin: "0 20px" }}>
                {children}
            </main>
            <div style={{ width: "300px" }}>
                <RightSidebar />
            </div>
        </div>
    )
}
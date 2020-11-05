import "sweetalert2/dist/sweetalert2.css"
import "./css/app.css"
import Store from "store/Store"

export const boot = async () => {
    await Store.init()
}

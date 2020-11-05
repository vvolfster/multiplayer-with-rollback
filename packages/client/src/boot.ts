import Store from "store/Store"

export const boot = async () => {
    await Store.init()
}

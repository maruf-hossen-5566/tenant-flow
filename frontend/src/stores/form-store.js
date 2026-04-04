import {create} from "zustand/react";


const initialStore = {
    loginForm: {
        username: "",
        password: "",
    },
    signupForm: {
        name: "",
        email: "",
        password: "",
        confPassword: ""
    }
}

export const useFormStore = create((set) => ({
    ...initialStore,

    changeLoginForm: (field, value) => set((state) => ({loginForm: {...state.loginForm, [field]: value}})),
    changeSignupForm: (field, value) => set((state) => ({signupForm: {...state.signupForm, [field]: value}})),
    clearStore: () => set(initialStore)
}))
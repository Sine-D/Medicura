import React, { createContext, useEffect, useState } from "react";
import axios from 'axios'
import { doctors as seededDoctors } from "../assets/assets";

export const AppContext = createContext({ doctors: [] });

const AppContextProvider = (props) => {

const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : "");
const [user, setUser] = useState(null)
const [doctors, setDoctors] = useState(seededDoctors || [])
const [loadingDoctors, setLoadingDoctors] = useState(false)
const currencySymbol = '$'
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

const refreshDoctors = async () => {
    try{
        setLoadingDoctors(true)
        const res = await axios.get(backendUrl + '/api/doctors')
        const data = res?.data
        if(data?.success && Array.isArray(data.doctors)){
            setDoctors(data.doctors)
        }
    }catch(err){
        // keep existing list on error
    }finally{
        setLoadingDoctors(false)
    }
}

useEffect(() => {
    refreshDoctors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [backendUrl])

        const value = {
            doctors,
            loadingDoctors,
            currencySymbol,
            backendUrl,
            token, setToken,
            user, setUser,
            refreshDoctors
        }

        return (
            <AppContext.Provider value={value}>
                 {props.children}
            </AppContext.Provider>
        )
}

export default AppContextProvider
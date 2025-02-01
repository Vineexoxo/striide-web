
"use client";
import { FC, useEffect } from 'react'
import ReportForm from '@/components/reports/ReportsForm'
import { checkAuthCookie } from '@/lib/check-auth';

const page: FC = ({ }) => {

    useEffect(() => {
        checkAuthCookie();
    }, []);

    return <ReportForm />
}


export default page
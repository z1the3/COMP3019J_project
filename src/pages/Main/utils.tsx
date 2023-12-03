import { Link } from "@arco-design/web-react";
import { ColumnProps } from "@arco-design/web-react/es/Table";
import { useNavigate } from "react-router-dom";


// All fields of the appointment data table and Mapping relationship with data sources (for guest)
export const columns: ColumnProps<unknown>[] = [
    {
        title: 'Name',
        dataIndex: 'name',
    },
    {
        title: 'Service Providers',
        dataIndex: 'provider',
    },
    {
        title: 'Start Time',
        dataIndex: 'startTimeLimit',
    },
    {
        title: 'End Time',
        dataIndex: 'endTimeLimit',
    },
];



/* eslint-disable react/prop-types */
import Chip from '../../components/Chip';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

export const notificationColumn = [
  {
    maxSize: 10,
    header: 'S.No.',
    Cell: (props) => {
      const tableState = props?.table?.getState();
      const serialNumber = (
        props?.row?.index +
        1 +
        tableState?.pagination?.pageIndex * tableState?.pagination?.pageSize
      )
        ?.toString()
        ?.padStart(2, '0');
      return <span>{serialNumber}</span>;
    },
    enableSorting: false,
  },
  {
    minSize: 300,
    accessorKey: 'title',
    header: 'Title',
  },
  {
    minSize: 400,
    accessorKey: 'body',
    header: 'Message',
    Cell: ({ row }) => {
      const notification = row.original;
      let message = notification.body || '';
      
      // Replace orderNumber placeholder
      if (notification.orderNumber) {
        message = message.replace(/{{orderNumber}}/g, notification.orderNumber);
      }
      
      return <span>{message}</span>;
    }
  },
  {
    minSize: 200,
    accessorKey: 'restaurantName',
    header: 'Restaurant',
  },
  {
    minSize: 150,
    accessorKey: 'createdAt',
    header: 'Time',
    Cell: ({ row }) => {
      const timestamp = row.original.createdAt;
      
      if (!timestamp) return <span>-</span>;
      
      try {
        const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
        
        if (isToday(date)) {
          return <span>Today, {format(date, 'h:mm a')}</span>;
        } else if (isYesterday(date)) {
          return <span>Yesterday, {format(date, 'h:mm a')}</span>;
        } else {
          return <span>{format(date, 'MMM d, yyyy')}</span>;
        }
      } catch (error) {
        return <span>{timestamp}</span>;
      }
    },
  },
  {
    minSize: 100,
    accessorKey: 'isRead',
    header: 'Status',
    Cell: ({ row }) => {
      const isRead = row.original.isRead;
      return <Chip text={isRead ? 'Read' : 'Unread'} color={isRead ? 'gray' : 'primary'} />;
    },
  },
];

'use client';

import React, { createContext, useContext } from 'react';
import axios from 'axios';
import { useAuth } from '@/components/auth/useAuth';

interface ApiClient {
  listServers: () => Promise<Record<string, string>>;
  listTools: (server: string) => Promise<any>;
  callTool: (server: string, tool: string, args: any) => Promise<any>;
}

interface ApiContextType {
  client: ApiClient;
}

export const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { getToken } = useAuth();

  const client: ApiClient = {
    listServers: async () => {
      const response = await axios.get('/api/servers', {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      return response.data;
    },

    listTools: async (server: string) => {
      const response = await axios.get(`/api/servers/${server}/tools`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      return response.data;
    },

    callTool: async (server: string, tool: string, args: any) => {
      const response = await axios.post(
        `/api/servers/${server}/tools/${tool}`,
        args,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      return response.data;
    },
  };

  return (
    <ApiContext.Provider value={{ client }}>{children}</ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

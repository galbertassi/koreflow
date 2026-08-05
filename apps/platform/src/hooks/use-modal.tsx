"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type ModalType =
  | "CREATE_EXECUTION"
  | "EDIT_EXECUTION"
  | "CREATE_PROJECT"
  | "CREATE_GOAL"
  | "CREATE_PLANNING"
  | "CONFIGURE_KORE_AI"
  | null;

interface ModalData {
  [key: string]: unknown;
}

interface ModalContextType {
  type: ModalType;
  isOpen: boolean;
  data: ModalData;
  openModal: (type: ModalType, data?: ModalData) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [type, setType] = useState<ModalType>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<ModalData>({});

  const openModal = (type: ModalType, data: ModalData = {}) => {
    setType(type);
    setData(data);
    setIsOpen(true);
  };

  const closeModal = () => {
    setType(null);
    setIsOpen(false);
    setData({});
  };

  return (
    <ModalContext.Provider value={{ type, isOpen, data, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}

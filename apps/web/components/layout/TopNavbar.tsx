'use client';

import React from "react";
import {
  Navbar, NavbarBrand, NavbarContent, NavbarItem, 
  NavbarMenuToggle, NavbarMenu, NavbarMenuItem,
  Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, 
  Avatar, Link
} from "@nextui-org/react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function TopNavbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const router = useRouter();

  // Menu items untuk tampilan Mobile
  const menuItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Bank Soal", href: "/dashboard/assessments" },
    { name: "Data Siswa", href: "/dashboard/students" },
    { name: "Nilai & Laporan", href: "/dashboard/reports" },
  ];

  const handleLogout = () => {
    // 1. Hapus Cookie
    Cookies.remove("token");
    // 2. Lempar ke Login
    router.replace("/login");
  };

  return (
    <Navbar 
      onMenuOpenChange={setIsMenuOpen} 
      maxWidth="full" 
      className="bg-white/70 backdrop-blur-md border-b border-gray-200"
    >
      {/* 1. HAMBURGER MENU (Hanya muncul di Mobile/sm) */}
      <NavbarContent className="md:hidden">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="md:hidden"
        />
      </NavbarContent>

      {/* 2. BRAND LOGO (Tengah di Mobile, Kiri di Desktop) */}
      <NavbarContent className="pr-3" justify="center">
        <NavbarBrand>
          <p className="font-bold text-inherit text-blue-600">BKLM CBT</p>
        </NavbarBrand>
      </NavbarContent>

      {/* 3. PROFILE DROPDOWN (Pojok Kanan) */}
      <NavbarContent justify="end">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
              color="primary"
              name="Guru"
              size="sm"
              src="https://i.pravatar.cc/150?u=a042581f4e29026024d" // Gambar dummy
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Login sebagai</p>
              <p className="font-semibold text-primary">guru@sekolah.sch.id</p>
            </DropdownItem>
            <DropdownItem key="settings">Pengaturan Akun</DropdownItem>
            <DropdownItem key="help_and_feedback">Bantuan</DropdownItem>
            <DropdownItem key="logout" color="danger" onPress={handleLogout}>
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>

      {/* 4. ISI MENU MOBILE (Muncul saat Hamburger diklik) */}
      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`}>
            <Link
              color="foreground"
              className="w-full"
              href={item.href}
              size="lg"
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
        {/* Tombol Logout Mobile */}
         <NavbarMenuItem>
            <Link color="danger" className="w-full" href="#" onPress={handleLogout} size="lg">
              Log Out
            </Link>
         </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI support for autoupgrade
LUCI_DEPENDS:=+luci-base +autoupgrade

PKG_VERSION:=0.5.0
PKG_RELEASE:=1
PKG_LICENSE:=Apache-2.0
PKG_MAINTAINER:=Cameron Thompson <cameronst2@gmail.com>

LUCI_MK:=$(wildcard $(TOPDIR)/feeds/luci/luci.mk)
LUCI_MK?=../../luci.mk
include $(LUCI_MK)

# call BuildPackage - OpenWrt buildroot signature

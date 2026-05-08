include $(TOPDIR)/rules.mk

PKG_NAME:=opkg-autoupgrade
PKG_VERSION:=0.0.1
PKG_RELEASE:=1
PKG_LICENSE:=GPL-2.0-only
PKG_MAINTAINER:=Cameron Thompson <cameronst2@gmail.com>

include $(INCLUDE_DIR)/package.mk

define Package/opkg-autoupgrade
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=Selective scheduled package upgrades
  PKGARCH:=all
endef

define Package/opkg-autoupgrade/description
  Automatically upgrade a user-defined list of packages on a schedule.
  Configurable via UCI. Each package is upgraded individually with full
  logging of successes, warnings, and failures.
endef

define Package/opkg-autoupgrade/conffiles
/etc/config/opkg-autoupgrade
endef

define Build/Prepare
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/opkg-autoupgrade/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) ./files/opkg-autoupgrade.sh $(1)/usr/bin/opkg-autoupgrade

	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/opkg-autoupgrade.init $(1)/etc/init.d/opkg-autoupgrade

	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) ./files/opkg-autoupgrade.conf $(1)/etc/config/opkg-autoupgrade

	$(INSTALL_BIN) ./files/opkg-autoupgrade-clearlog.sh $(1)/usr/bin/opkg-autoupgrade-clearlog

	$(INSTALL_DIR) $(1)/usr/libexec
	$(INSTALL_BIN) ./files/opkg-autoupgrade-list.sh $(1)/usr/libexec/opkg-autoupgrade-list
endef

$(eval $(call BuildPackage,opkg-autoupgrade))

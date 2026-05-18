include $(TOPDIR)/rules.mk

PKG_NAME:=autoupgrade
PKG_VERSION:=0.5.0
PKG_RELEASE:=1
PKG_LICENSE:=GPL-2.0-only
PKG_LICENSE_FILES:=LICENSE
PKG_MAINTAINER:=Cameron Thompson <cameronst2@gmail.com>

include $(INCLUDE_DIR)/package.mk

define Package/autoupgrade
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=Selective scheduled package upgrades
  PKGARCH:=all
endef

define Package/autoupgrade/description
  Automatically upgrade a user-defined list of packages on a schedule.
  Configurable via UCI. Each package is upgraded individually with full
  logging of successes, warnings, and failures.
endef

define Package/autoupgrade/conffiles
/etc/config/autoupgrade
endef

define Build/Prepare
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/autoupgrade/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) ./files/autoupgrade.sh $(1)/usr/bin/autoupgrade

	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/autoupgrade.init $(1)/etc/init.d/autoupgrade

	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) ./files/autoupgrade.conf $(1)/etc/config/autoupgrade

	$(INSTALL_BIN) ./files/autoupgrade-clearlog.sh $(1)/usr/bin/autoupgrade-clearlog

	$(INSTALL_DIR) $(1)/usr/libexec
	$(INSTALL_BIN) ./files/autoupgrade-list.sh $(1)/usr/libexec/autoupgrade-list
endef

$(eval $(call BuildPackage,autoupgrade))

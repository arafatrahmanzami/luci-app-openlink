include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-openlink
PKG_VERSION:=1.0
PKG_RELEASE:=1

include $(INCLUDE_DIR)/package.mk

define Package/luci-app-openlink
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=3. Applications
  TITLE:=OpenLink Captive Portal UI
  DEPENDS:=+luci-base +luci-compat +openlink-portal
endef

define Build/Compile
endef

define Package/luci-app-openlink/install
	# Install the JS frontend
	$(INSTALL_DIR) $(1)/www/luci-static/resources/view/openlink
	$(INSTALL_DATA) ./htdocs/luci-static/resources/view/openlink/*.js $(1)/www/luci-static/resources/view/openlink/

	# Install the LuCI menu and ACL
	$(INSTALL_DIR) $(1)/usr/share/luci/menu.d
	$(INSTALL_DATA) ./root/usr/share/luci/menu.d/*.json $(1)/usr/share/luci/menu.d/
	
	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	$(INSTALL_DATA) ./root/usr/share/rpcd/acl.d/*.json $(1)/usr/share/rpcd/acl.d/
endef

$(eval $(call BuildPackage,luci-app-openlink))

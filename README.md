# quixx board

to build do:
copy android-freakysmartlab.jks from dropbox to fastlane/release-cred folder
copy service-account-freakysmartlab.json from dropbox to fastlane/release-cred folder

create file fastlane/.env and add KEY_PASS & STORE_PASS.

Release:
change config.xml new version
do:
fastlane release android
fastlane release ios

release android version: https://play.google.com/apps/publish/?dev_acc=04888882263212929990#MarketListingPlace:p=ch.frick.quixx_smart_board
release ios version: https://itunesconnect.apple.com/WebObjects/iTunesConnect.woa/ra/ng/app/1204744153/ios/versioninfo

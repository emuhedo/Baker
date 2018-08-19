; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{FF82CC8F-9CAD-4210-97AA-2C5F955DB742}
AppName=Baker
AppVersion=0.6.4
;AppVerName=Baker 0.4.3
AppPublisher=Ottomatica LLC
AppPublisherURL=https://getbaker.io/
AppSupportURL=https://getbaker.io/
AppUpdatesURL=https://getbaker.io/
DefaultDirName=C:\Ottomatica\Baker
DisableDirPage=yes
DefaultGroupName=Baker
DisableProgramGroupPage=yes
OutputDir=./bin
OutputBaseFilename=baker-setup
Compression=lzma
SolidCompression=yes

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "{#SourcePath}/../bin/baker.exe"; DestDir: "{app}"; Flags: ignoreversion
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{group}\{cm:UninstallProgram,Baker}"; Filename: "{uninstallexe}"

[Registry]
Root: HKLM; Subkey: "SYSTEM\CurrentControlSet\Control\Session Manager\Environment"; \
    ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};C:\Ottomatica\Baker\"

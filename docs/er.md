# データベース設計

## ER図

![ER図](./images/er.svg)

Mermaidソースは[こちら](./diagrams/er.mmd)にあります。

## 概要

写真管理アプリケーションのデータベース設計です。すべての写真はPhotoSpaceに属し、ユーザーはPhotoSpaceのメンバーとして写真を管理します。各ユーザーは自動的にプライベートスペースを持ち、個人の写真管理にも利用できます。

## 認証

- AWS Cognitoを使用したユーザー認証
- ユーザーはCognitoで管理され、アプリケーションのUserテーブルとcognitoSubで紐付け
- パスワード管理やMFAなどの認証機能はCognitoに委譲

## 主な関係性

1. User - PhotoSpaceMember
   - 1人のユーザーは複数のPhotoSpaceのメンバーになれる
   - メンバーシップは必ずユーザーに紐づく
   - ユーザー作成時に自動的にプライベートスペースのメンバーとなる

2. PhotoSpace - PhotoSpaceMember
   - 1つのPhotoSpaceは複数のメンバーを持てる
   - メンバーシップは必ずPhotoSpaceに紐づく
   - isPrivateフラグにより、個人用のプライベートスペースと共有用のスペースを区別

3. PhotoSpace - PhotoAlbum
   - 1つのPhotoSpaceは複数のアルバムを持てる
   - アルバムは必ず1つのPhotoSpaceに属する
   - プライベートスペースでも共有スペースでも同じようにアルバムを作成可能

4. PhotoSpaceMember - Photo
   - メンバーは複数の写真をアップロードできる
   - 写真は必ず1人の作成者（PhotoSpaceMember）に紐づく
   - 作成者の権限はPhotoSpaceMemberのroleによって管理

5. PhotoAlbum - Photo
   - 1つのアルバムは複数の写真を含むことができる
   - 1つの写真は複数のアルバムに属することができる
   - アルバム内の写真はすべて同じPhotoSpaceに属する

## アクセス制御

- メンバーは3つの権限レベルを持つ
  - OWNER: PhotoSpaceの管理、メンバー管理が可能
  - CONTRIBUTOR: 写真のアップロード、アルバム作成が可能
  - VIEWER: 写真とアルバムの閲覧のみ可能
- プライベートスペースでは、作成者が自動的にOWNER権限を持つ
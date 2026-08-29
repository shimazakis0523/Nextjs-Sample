# 機能概要: Todoダッシュボード

**機能ディレクトリ**: `001-todo-dashboard`

**作成日**: 2026-08-29

**ステータス**: Draft

## 目次

1. [概要](#概要)
2. [画面一覧](#画面一覧)

## 概要

ログイン不要で誰でも使える、Todoの一覧表示・新規登録・削除ができる機能。この機能は以下の
2つの画面で構成される。各画面のユースケース・画面定義(画面入出力仕様・処理仕様)は、それぞ
れの画面仕様書を参照すること。

## 画面一覧

| 画面ID | 画面名 | URL | 仕様書 |
|---|---|---|---|
| `todo-list` | Todo一覧 | `/dashboard` | [screens/todo-list/spec.md](screens/todo-list/spec.md) |
| `todo-new` | Todo新規登録 | なし(モーダル) | [screens/todo-new/spec.md](screens/todo-new/spec.md) |

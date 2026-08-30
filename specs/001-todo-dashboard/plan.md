# Implementation Plan: Todoダッシュボード

**Branch**: `001-todo-dashboard` | **Spec**: [spec.md](./spec.md)

この機能は画面ごとにplan.mdを持つ(ADR-0006)。このファイルはポインタのみで、設計内容は
持たない(`.specify/scripts/bash/check-prerequisites.sh`がこのパスの存在を前提にしている
ため、削除はできない)。

- [screens/todo-list/plan.md](./screens/todo-list/plan.md)
- [screens/todo-new/plan.md](./screens/todo-new/plan.md)

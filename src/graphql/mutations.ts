import { gql } from '@apollo/client'

export const UPDATE_CHAT_TITLE = gql`
  mutation UpdateChatTitle($chat_id: uuid!, $title: String!) {
    update_chats_by_pk(pk_columns: { id: $chat_id }, _set: { title: $title }) {
      id
      title
    }
  }
`


export const CREATE_CHAT = gql`
  mutation CreateChat($title: String!, $user_id: uuid!) {
    insert_chats_one(object: { title: $title, user_id: $user_id }) {
      id
      title
      created_at
      updated_at
      user_id
    }
  }
`

export const SEND_MESSAGE = gql`
  mutation SendMessage($chat_id: uuid!, $content: String!, $user_id: uuid!) {
    insert_messages_one(
      object: { 
        chat_id: $chat_id,
        user_id: $user_id,
        content: $content,
        is_bot: false 
      }
    ) {
      id
      content
      is_bot
      created_at
      user_id
    }
  }
`

export const SEND_MESSAGE_ACTION = gql`
  mutation SendMessageAction($chat_id: uuid!, $message: String!, $message_id: uuid!, $user_id: uuid!) {
    sendMessage(chat_id: $chat_id, message: $message, message_id: $message_id, user_id: $user_id) {
      message
    }
  }
`

export const UPDATE_CHAT_TIMESTAMP = gql`
  mutation UpdateChatTimestamp($chat_id: uuid!) {
    update_chats_by_pk(
      pk_columns: { id: $chat_id }
      _set: { updated_at: "now()" }
    ) {
      id
      updated_at
    }
  }
`

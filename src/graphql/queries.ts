import { gql } from '@apollo/client'

export const GET_CHATS = gql`
query MyQuery($user_id: uuid!) {
  chats(
    where: {user_id: {_eq: $user_id}}
     order_by: { created_at: desc }
    ) {
    title
    id
    created_at
    updated_at
    user_id
  }
}
`

export const GET_MESSAGES = gql`
  query GetMessages($chat_id: uuid!) {
    messages(
      where: { chat_id: { _eq: $chat_id } }
      order_by: { created_at: asc }
    ) {
      id
      content
      is_bot
      created_at
      user_id
    }
  }
`
import gql from 'graphql-tag';

export const GET_ME = gql`
    {
        me {
            savedBooks {
                bookId
                authors
                description
                title
                image
                link
            }
        }
    }
`;
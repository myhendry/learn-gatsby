import React, { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'

import { FirebaseContext } from '../../services/Firebase'
import { Form, Input, Button, MenuAdmin } from '../common'

const FormField = styled.div`
  margin-bottom: 20px;
`

let fileReader
if (typeof window !== 'undefined') {
  fileReader = new FileReader()
}

const Intranet = () => {
  const { firebase } = useContext(FirebaseContext)
  const [authors, setAuthors] = useState([])
  const [bookCover, setBookCover] = useState('')
  const [bookName, setBookName] = useState('')
  const [authorId, setAuthorId] = useState('')
  const [summary, setSummary] = useState('')
  const [success, setSuccess] = useState(false)
  let isMounted = true

  useEffect(() => {
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    fileReader.addEventListener('load', () => {
      setBookCover(fileReader.result)
    })
  }, [])

  useEffect(() => {
    if (firebase) {
      firebase.getAuthors().then(snapshot => {
        if (isMounted) {
          const availableAuthors = []
          snapshot.forEach(doc => {
            availableAuthors.push({
              id: doc.id,
              ...doc.data(),
            })
          })

          setAuthorId(availableAuthors[0].id)

          setAuthors(availableAuthors)
        }
      })
    }
  }, [firebase])

  return (
    <>
      <MenuAdmin />
      <Form
        onSubmit={e => {
          e.preventDefault()
          console.log(bookName, bookCover, authorId, summary)
          firebase
            .createBook({
              bookCover,
              bookName,
              authorId,
              summary,
            })
            .then(() => {
              console.log('book created successfully')
              if (isMounted) {
                setSuccess(true)
              }
            })
        }}
      >
        <FormField>
          <Input
            placeholder="book name"
            value={bookName}
            onChange={e => {
              e.persist()
              setSuccess(false)
              setBookName(e.target.value)
            }}
          />
        </FormField>
        <FormField>
          <strong>Author</strong>
          <div>
            <select
              value={authorId}
              onChange={e => {
                e.persist()
                setSuccess(false)
                setAuthorId(e.target.value)
              }}
            >
              {authors.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </FormField>
        <FormField>
          <strong>Summary</strong>
          <Input
            type="text"
            value={summary}
            onChange={e => {
              e.persist()
              setSuccess(false)
              setSummary(e.target.value)
            }}
          />
        </FormField>
        <FormField>
          <strong>Book Cover</strong>
          <Input
            type="file"
            onChange={e => {
              e.persist()
              setSuccess(false)
              fileReader.readAsDataURL(e.target.files[0])
            }}
          />
        </FormField>
        {!!success && <span>New Book Added Successfully</span>}
        <Button block type="submit">
          Add New Book
        </Button>
      </Form>
    </>
  )
}

export default Intranet

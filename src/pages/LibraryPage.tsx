import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { BookOpen, Search, Plus, BookCheck, BookX } from "lucide-react";
import * as kv from "../utils/backend/api";
import { Book, BookIssue } from "../types";

export const LibraryPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [issues, setIssues] = useState<BookIssue[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const booksData = await kv.getByPrefix("book:");
      const issuesData = await kv.getByPrefix("issue:");
      setBooks(booksData);
      setIssues(issuesData);
    } catch (error) {
      console.error("Error loading library data:", error);
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm)
  );

  const totalBooks = books.reduce((sum, book) => sum + book.copies, 0);
  const availableBooks = books.reduce((sum, book) => sum + book.available, 0);
  const issuedBooks = totalBooks - availableBooks;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Library Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage books and issue records
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Book
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Total Books</p>
                <h3 className="mt-2">{totalBooks}</h3>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Available</p>
                <h3 className="mt-2">{availableBooks}</h3>
              </div>
              <BookCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Issued</p>
                <h3 className="mt-2">{issuedBooks}</h3>
              </div>
              <BookX className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Book Catalog</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search books..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>ISBN</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Total Copies</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.isbn}</TableCell>
                  <TableCell>{book.category}</TableCell>
                  <TableCell>{book.copies}</TableCell>
                  <TableCell>{book.available}</TableCell>
                  <TableCell>
                    {book.available > 0 ? (
                      <Badge className="bg-green-600">Available</Badge>
                    ) : (
                      <Badge variant="destructive">Out of Stock</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book ID</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Return Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issues.slice(0, 10).map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell>{issue.bookId}</TableCell>
                  <TableCell>{issue.studentId}</TableCell>
                  <TableCell>
                    {new Date(issue.issueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(issue.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {issue.returnDate
                      ? new Date(issue.returnDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        issue.status === "returned"
                          ? "secondary"
                          : issue.status === "overdue"
                          ? "destructive"
                          : "default"
                      }
                    >
                      {issue.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

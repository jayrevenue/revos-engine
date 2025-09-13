import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Download, ExternalLink, Edit, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface DocumentType {
  id: string;
  title: string;
  description: string;
  category: string;
  file_url: string;
  file_type: string;
  content: string;
  tags: string[];
  status: string;
  size_bytes: number;
  created_at: string;
  updated_at: string;
}

interface DocumentViewerProps {
  document: DocumentType;
  onBack: () => void;
  onEdit?: (document: DocumentType) => void;
  onDelete?: (documentId: string) => void;
}

const DocumentViewer = ({ document, onBack, onEdit, onDelete }: DocumentViewerProps) => {
  const [content, setContent] = useState(document.content || '');

  useEffect(() => {
    // If we have a file URL but no content, try to fetch it
    if (document.file_url && !document.content && document.file_type === 'markdown') {
      fetchFileContent();
    }
  }, [document]);

  const fetchFileContent = async () => {
    try {
      const response = await fetch(document.file_url);
      const text = await response.text();
      setContent(text);
    } catch (error) {
      console.error('Failed to fetch file content:', error);
    }
  };

  const handleDownload = () => {
    if (document.file_url) {
      window.open(document.file_url, '_blank');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Documents
        </Button>
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(document)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {document.file_url && (
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
          {document.file_url && (
            <Button variant="outline" onClick={() => window.open(document.file_url, '_blank')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" onClick={() => onDelete(document.id)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{document.title}</CardTitle>
              {document.description && (
                <p className="text-muted-foreground">{document.description}</p>
              )}
            </div>
            <Badge variant="outline">{document.category}</Badge>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2">
            {document.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex gap-4 text-sm text-muted-foreground pt-2">
            <span>Type: {document.file_type}</span>
            {document.size_bytes && (
              <span>Size: {formatFileSize(document.size_bytes)}</span>
            )}
            <span>Created: {new Date(document.created_at).toLocaleDateString()}</span>
          </div>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[600px] w-full">
            {document.file_type === 'markdown' ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <div className="whitespace-pre-wrap font-mono text-sm">
                {content || 'No content preview available for this file type.'}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentViewer;
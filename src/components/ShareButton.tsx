
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ShareButtonProps {
  title: string;
  url?: string;
  variant?: 'default' | 'outline';
  className?: string;
}

const ShareButton = ({ title, url = window.location.href, variant = 'outline', className = '' }: ShareButtonProps) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Enlace copiado",
        description: "El enlace se ha copiado al portapapeles",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive"
      });
    }
  };

  const handleNativeShare = async () => {
    const text = `Mira ${title} en Cuevana3`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying link if native share is not available
      handleCopyLink();
    }
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Mira ${title} en Cuevana3`)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const shareOnWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Mira ${title} en Cuevana3 ${url}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant}
          className={`flex items-center gap-2 ${className}`}
        >
          <Share2 className="h-4 w-4" /> Compartir
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-cuevana-gray-100 border-cuevana-gray-200 w-48">
        <DropdownMenuItem onClick={handleCopyLink} className="text-cuevana-white hover:bg-cuevana-blue cursor-pointer">
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
          {copied ? 'Copiado!' : 'Copiar enlace'}
        </DropdownMenuItem>
        
        {navigator.share && (
          <DropdownMenuItem onClick={handleNativeShare} className="text-cuevana-white hover:bg-cuevana-blue cursor-pointer">
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={shareOnFacebook} className="text-cuevana-white hover:bg-cuevana-blue cursor-pointer">
          <div className="h-4 w-4 mr-2 bg-blue-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">f</div>
          Facebook
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareOnTwitter} className="text-cuevana-white hover:bg-cuevana-blue cursor-pointer">
          <div className="h-4 w-4 mr-2 bg-blue-400 rounded-sm flex items-center justify-center text-white text-xs font-bold">T</div>
          Twitter
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareOnWhatsApp} className="text-cuevana-white hover:bg-cuevana-blue cursor-pointer">
          <div className="h-4 w-4 mr-2 bg-green-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">W</div>
          WhatsApp
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;
